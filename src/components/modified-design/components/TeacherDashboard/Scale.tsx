import React from 'react';

const Scale = () => {
    return (
        <>
            <div className="flex justify-between text-[10px] text-gray-500">
                {[...Array(11)].map((_, i) => (
                    <span key={i}>{i * 10}</span>
                ))}
            </div>
            {/* <hr className='mb-2' /> */}
        </>
    );
};

export default Scale;
