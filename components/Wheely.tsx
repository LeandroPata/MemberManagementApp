import { useFocusEffect } from '@react-navigation/native';
import type React from 'react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
	type AccessibilityActionEvent,
	Animated,
	type FlatList,
	type FlatListProps,
	type ListRenderItem,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	type StyleProp,
	type TextStyle,
	View,
	type ViewProps,
	type ViewStyle,
} from 'react-native';
import styles from 'react-native-wheely/lib/WheelPicker.styles';
import WheelPickerItem from 'react-native-wheely/lib/WheelPickerItem';

const accessibilityActions = [{ name: 'increment' }, { name: 'decrement' }];
interface Props {
	selectedIndex: number;
	options: string[];
	onChange: (index: number) => void;
	selectedIndicatorStyle?: StyleProp<ViewStyle>;
	itemTextStyle?: TextStyle;
	itemStyle?: ViewStyle;
	itemHeight?: number;
	containerStyle?: ViewStyle;
	containerProps?: Omit<ViewProps, 'style'>;
	scaleFunction?: (x: number) => number;
	rotationFunction?: (x: number) => number;
	opacityFunction?: (x: number) => number;
	visibleRest?: number;
	decelerationRate?: 'normal' | 'fast' | number;
	flatListProps?: Omit<FlatListProps<string | null>, 'data' | 'renderItem'>;
}

const keyExtractor = (item: string | null, index: number) =>
	item ?? index.toString();

// rewrite the component from the lib due to this problem https://github.com/erksch/react-native-wheely/issues/64
// the issue is the animated props on scroll to index
export const WheelPicker: React.FC<Props> = memo(
	({
		selectedIndex,
		options,
		onChange,
		selectedIndicatorStyle = {},
		containerStyle = {},
		itemStyle = {},
		itemTextStyle = {},
		itemHeight = 40,
		scaleFunction = (x: number) => 1.0 ** x,
		rotationFunction = (x: number) => 1 - (1 / 2) ** x,
		opacityFunction = (x: number) => (1 / 3) ** x,
		visibleRest = 2,
		decelerationRate = 'fast',
		containerProps = {},
		flatListProps = {},
	}) => {
		const flatListRef = useRef<FlatList>(null);
		const [scrollY] = useState(new Animated.Value(0));

		const containerHeight = (1 + visibleRest * 2) * itemHeight;
		const paddedOptions = useMemo(() => {
			const array: (string | null)[] = [...options];
			for (let i = 0; i < visibleRest; i++) {
				array.unshift(null);
				array.push(null);
			}
			return array;
		}, [options, visibleRest]);

		const offsets = useMemo(
			() => [...Array(paddedOptions.length)].map((x, i) => i * itemHeight),
			[paddedOptions, itemHeight],
		);

		const currentScrollIndex = useMemo(
			() => Animated.add(Animated.divide(scrollY, itemHeight), visibleRest),
			[visibleRest, scrollY, itemHeight],
		);

		const onAccessibilityAction = useCallback(
			(event: AccessibilityActionEvent) => {
				if (
					event.nativeEvent.actionName === 'increment' &&
					selectedIndex < options.length - 1
				) {
					return flatListRef.current?.scrollToIndex({
						index: selectedIndex + 1,
						animated: false,
					});
				}

				if (event.nativeEvent.actionName === 'decrement' && selectedIndex > 0) {
					return flatListRef.current?.scrollToIndex({
						index: selectedIndex - 1,
						animated: false,
					});
				}
			},
			[options.length, selectedIndex],
		);

		const handleMomentumScrollEnd = useCallback(
			(event: NativeSyntheticEvent<NativeScrollEvent>) => {
				// Due to list bounciness when scrolling to the start or the end of the list
				// the offset might be negative or over the last item.
				// We therefore clamp the offset to the supported range.
				const offsetY = Math.min(
					itemHeight * (options.length - 1),
					Math.max(event.nativeEvent.contentOffset.y, 0),
				);

				let index = Math.floor(Math.floor(offsetY) / itemHeight);
				const last = Math.floor(offsetY % itemHeight);
				if (last > itemHeight / 2) {
					index++;
				}

				if (index !== selectedIndex) {
					onChange(index);
				}
			},
			[itemHeight, onChange, options.length, selectedIndex],
		);

		const renderItem = useCallback<ListRenderItem<string | null>>(
			({ item, index }) => (
				<WheelPickerItem
					index={index}
					option={item}
					style={itemStyle}
					textStyle={itemTextStyle}
					height={itemHeight}
					currentScrollIndex={currentScrollIndex}
					scaleFunction={scaleFunction}
					rotationFunction={rotationFunction}
					opacityFunction={opacityFunction}
					visibleRest={visibleRest}
				/>
			),
			[
				currentScrollIndex,
				itemHeight,
				itemStyle,
				itemTextStyle,
				opacityFunction,
				rotationFunction,
				scaleFunction,
				visibleRest,
			],
		);

		const getLayoutItem = useCallback<
			Exclude<FlatList['props']['getItemLayout'], undefined>
		>(
			(_, index) => ({
				length: itemHeight,
				offset: itemHeight * index,
				index,
			}),
			[itemHeight],
		);

		// eslint-disable-next-line react-hooks/exhaustive-deps
		const onScroll = useCallback(
			Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
				useNativeDriver: true,
			}),
			[],
		);

		/**
		 * If selectedIndex is changed from outside (not via onChange) we need to scroll to the specified index.
		 * This ensures that what the user sees as selected in the picker always corresponds to the value state.
		 */
		useFocusEffect(
			useCallback(() => {
				if (selectedIndex < 0 || selectedIndex >= options.length) {
					throw new Error(
						`Selected index ${selectedIndex} is out of bounds [0, ${
							options.length - 1
						}]`,
					);
				}
				flatListRef.current?.scrollToIndex({
					index: selectedIndex,
					animated: true,
				});
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, [selectedIndex]),
		);

		return (
			<View
				style={[styles.container, { height: containerHeight }, containerStyle]}
				{...containerProps}
				accessible
				accessibilityActions={accessibilityActions}
				accessibilityRole='combobox'
				onAccessibilityAction={onAccessibilityAction}
			>
				<View
					style={[
						styles.selectedIndicator as any,
						selectedIndicatorStyle,
						{
							transform: [{ translateY: -itemHeight / 2 }],
							height: itemHeight,
						},
					]}
				/>
				<Animated.FlatList<string | null>
					{...flatListProps}
					ref={flatListRef}
					testID='wheel-picker-flatlist'
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					onScroll={onScroll}
					onMomentumScrollEnd={handleMomentumScrollEnd}
					snapToOffsets={offsets}
					decelerationRate={decelerationRate}
					getItemLayout={getLayoutItem}
					data={paddedOptions}
					keyExtractor={keyExtractor}
					renderItem={renderItem}
				/>
			</View>
		);
	},
);
