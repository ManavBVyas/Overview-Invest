import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';
import './Counter.css';

function Number({ mv, number, height }) {
    let y = useTransform(mv, latest => {
        let placeValue = latest % 10;
        let offset = (10 + number - placeValue) % 10;
        let memo = offset * height;
        if (offset > 5) {
            memo -= 10 * height;
        }
        return memo;
    });
    return (
        <motion.span className="counter-number" style={{ y }}>
            {number}
        </motion.span>
    );
}

function Digit({ place, value, height, digitStyle, isDecimal = false }) {
    // Extract the specific digit for this place
    let digitValue = 0;
    if (isDecimal) {
        const multiplier = Math.round(1 / place);
        digitValue = Math.floor(Math.round(value * multiplier) % 10);
    } else {
        digitValue = Math.floor(value / place) % 10;
    }

    // To animate from 0 on mount, start at 0
    const mv = useMotionValue(0);
    const animatedValue = useSpring(mv, {
        stiffness: 60,
        damping: 15,
        mass: 1
    });

    useEffect(() => {
        mv.set(digitValue);
    }, [digitValue, mv]);

    return (
        <div className="counter-digit" style={{ height, ...digitStyle }}>
            {Array.from({ length: 10 }, (_, i) => (
                <Number key={i} mv={animatedValue} number={i} height={height} />
            ))}
        </div>
    );
}

export default function Counter({
    value,
    fontSize = 100,
    padding = 0,
    places: providedPlaces,
    gap = 4,
    borderRadius = 4,
    horizontalPadding = 8,
    textColor = 'white',
    fontWeight = 'bold',
    containerStyle,
    counterStyle,
    digitStyle,
    gradientHeight = 16,
    gradientFrom = 'rgba(0,0,0,0.5)',
    gradientTo = 'transparent',
    topGradientStyle,
    bottomGradientStyle
}) {
    const height = fontSize + padding;

    const getAutoPlaces = (val) => {
        const intPart = Math.floor(Math.abs(val));
        const str = intPart.toString();
        const p = [];
        for (let i = str.length - 1; i >= 0; i--) {
            p.unshift(Math.pow(10, i));
        }
        return p.length > 0 ? p : [1];
    };

    const integerPlaces = providedPlaces || getAutoPlaces(value);
    const decimalPlaces = [0.1, 0.01];

    const defaultCounterStyle = {
        fontSize,
        gap: gap,
        borderRadius: borderRadius,
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
        color: textColor,
        fontWeight: fontWeight
    };

    const defaultTopGradientStyle = {
        height: gradientHeight,
        background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`
    };
    const defaultBottomGradientStyle = {
        height: gradientHeight,
        background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`
    };

    return (
        <div className="counter-container" style={containerStyle}>
            <div className="counter-counter" style={{ ...defaultCounterStyle, ...counterStyle }}>
                {integerPlaces.map(place => (
                    <Digit key={`int-${place}`} place={place} value={value} height={height} digitStyle={digitStyle} />
                ))}
                <div style={{ padding: `0 ${gap / 2}px`, alignSelf: 'flex-end', paddingBottom: '0.1em' }}>.</div>
                {decimalPlaces.map(place => (
                    <Digit key={`dec-${place}`} place={place} value={value} height={height} digitStyle={digitStyle} isDecimal={true} />
                ))}
            </div>
            <div className="gradient-container">
                <div className="top-gradient" style={topGradientStyle ? topGradientStyle : defaultTopGradientStyle}></div>
                <div
                    className="bottom-gradient"
                    style={bottomGradientStyle ? bottomGradientStyle : defaultBottomGradientStyle}
                ></div>
            </div>
        </div>
    );
}
