import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export default function Chart({ data, color = '#38bdf8' }) {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#1e293b' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: '#334155' },
                horzLines: { color: '#334155' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
        });

        // Area Series for nice gradient
        seriesRef.current = chartRef.current.addAreaSeries({
            lineColor: color,
            topColor: color,
            bottomColor: 'rgba(56, 189, 248, 0.0)',
        });

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartRef.current.remove();
        };
    }, [color]);

    useEffect(() => {
        if (seriesRef.current && data) {
            // Data must be sorted by time. 
            // If we receive a single point, we update. If array, we set data.
            if (Array.isArray(data)) {
                seriesRef.current.setData(data);
            } else {
                seriesRef.current.update(data);
            }
        }
    }, [data]);

    return (
        <div ref={chartContainerRef} className="card" style={{ padding: 0, overflow: 'hidden' }} />
    );
}
