import React from 'react'

function GiftSection() {
  return (
    <div className='border border-black/30 dark:border-white/30 rounded-4xl p-7.5 gap-5 flex flex-col font-inter'>
        <div className='flex flex-col gap-1.25'>
            <h2 className='text-xl font-bold text-orange100'>650 gifts</h2>
            <p className='text-xs text-black dark:text-white'>Total this week</p>
        </div>
        <div className='flex items-center justify-between gap-3'>
            {
                [1,2,3,4,5,6,7].map(i => <div key={i} className='flex flex-col gap-4 max-w-24 w-full'>
                    <div className='flex flex-col h-86.5 bg-black/5 dark:white/10 justify-end'>
                    <div className='w-full h-49 bg-orange100 '></div>
                    </div>
                    <span className='text-xs text-black/85 dark:text-white/85 text-center'>Mon</span>
                </div>)
            }
        </div>
    </div>
  )
}

export default GiftSection