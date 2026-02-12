import React from 'react';

const Loader = () => {
    return (
        <div className="loader-overlay">
            <div className="loader-card">
                <div className="loader">
                    <p style={{ margin: 0, marginRight: '10px' }}>loading</p>
                    <div className="words">
                        <span className="word">Market</span>
                        <span className="word">Stocks</span>
                        <span className="word">Portfolio</span>
                        <span className="word">Charts</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
