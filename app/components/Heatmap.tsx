'use client';


// Generates dummy data for the last 35 days (5 weeks)
const generateHeatmapData = () => {
    const data = [];
    const now = new Date();
    for (let i = 34; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        // Random intensity 0-3
        const intensity = Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
        data.push({ date: d, intensity });
    }
    return data;
};

const Heatmap = () => {
  const data = generateHeatmapData();

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="text-center text-[10px] text-gray-400 mb-1">{day}</div>
        ))}
        
        {data.map((dayData, idx) => {
            let bgClass = 'bg-gray-100'; // level 0
            // Instagram-like warm colors
            if (dayData.intensity === 1) bgClass = 'bg-[#ffeebb]'; // light yellow/orange
            if (dayData.intensity === 2) bgClass = 'bg-[#ffc65c]'; // medium orange
            if (dayData.intensity === 3) bgClass = 'bg-[#f77737]'; // strong orange-red

            return (
                <div 
                    key={idx} 
                    className={`aspect-square rounded-sm ${bgClass} transition-all hover:opacity-80 relative group cursor-pointer`}
                >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        {dayData.date.toLocaleDateString()}
                    </div>
                </div>
            );
        })}
      </div>
      <div className="flex justify-end items-center gap-2 mt-3 text-[10px] text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
            <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-[#ffeebb] rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-[#ffc65c] rounded-sm"></div>
            <div className="w-2.5 h-2.5 bg-[#f77737] rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;