import React, { useState } from 'react';
import type {
	Animated,
	GestureResponderEvent,
	StyleProp,
	ViewStyle,
} from 'react-native';
import { Menu } from 'react-native-paper';

type MenuComponentProps = {
	anchor: React.ReactElement;
	style?: StyleProp<ViewStyle>;
	contentStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
	children: React.ReactElement | Array<React.ReactElement>;
};

const MenuComponent = (props: MenuComponentProps) => {
	const [visible, setVisible] = useState(false);
	const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

	const openMenu = (event: GestureResponderEvent) => {
		if (visible) closeMenu();
		const { pageX, pageY } = event.nativeEvent;
		const anchor = {
			x: pageX,
			y: pageY,
		};

		setMenuAnchor(anchor);
		setVisible(true);
	};
	const closeMenu = () => setVisible(false);

	const newAnchor = React.cloneElement(props.anchor, {
		onPressIn: closeMenu,
		onLongPress: openMenu,
	});

	const injectItems = React.Children.map(props.children, (child) => {
		if (!React.isValidElement(child)) return child;
		const originalOnPress = child.props.onPress;
		const injectedOnPress = (...args: any[]) => {
			closeMenu();
			if (originalOnPress) originalOnPress(...args);
		};

		return React.cloneElement(child, { onPress: injectedOnPress });
	});

	return (
		<>
			{newAnchor}
			<Menu
				visible={visible}
				onDismiss={closeMenu}
				anchor={menuAnchor}
				//style={props.style}
				//style={{ borderWidth: 5, borderRadius: 20 }}
				contentStyle={props.contentStyle}
				testID='MenuComponent'
			>
				{injectItems}
			</Menu>
		</>
	);
};

export default MenuComponent;
