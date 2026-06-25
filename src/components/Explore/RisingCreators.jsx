import React from "react";

const creators = [
  {
    id: 1,
    name: "Zara Vibes",
    role: "Comedian",
    followers: "4.2M",
    bio: "I'm Zara Vibes. A Professional Dancer, \nchoreographer & content creator.",
    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&h=150&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1547153760-18fc86324498?w=200&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=300&fit=crop",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=300&fit=crop"
    ]
  },
  {
    id: 2,
    name: "Zara Vibes",
    role: "Comedian",
    followers: "4.2M",
    bio: "I'm Zara Vibes. A Professional Dancer, \nchoreographer & content creator.",
    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&h=150&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1547153760-18fc86324498?w=200&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=300&fit=crop",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=300&fit=crop"
    ]
  },
  {
    id: 3,
    name: "Zara Vibes",
    role: "Comedian",
    followers: "4.2M",
    bio: "I'm Zara Vibes. A Professional Dancer, \nchoreographer & content creator.",
    avatar: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&h=150&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1547153760-18fc86324498?w=200&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=300&fit=crop",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=300&fit=crop"
    ]
  }
];

export default function RisingCreators() {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black dark:text-white text-lg font-bricolage font-semibold">Rising Creators</h3>
        <button className="text-orange100 text-sm font-medium hover:underline cursor-pointer bg-transparent border-none">
          See all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <div key={creator.id} className="bg-white100 dark:bg-slate100 rounded-2xl overflow-hidden border border-[#333] flex flex-col">
            {/* Image Collage Banner */}
            <div className="h-32 flex w-full relative">
              <div className="flex-1 overflow-hidden">
                <img src={creator.images[0]} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 overflow-hidden">
                <img src={creator.images[1]} className="w-full h-full object-cover grayscale brightness-75" alt="" />
              </div>
              <div className="flex-1 overflow-hidden">
                <img src={creator.images[2]} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-slate100 via-transparent to-transparent"></div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative flex-1">
              {/* Avatar overlapping the banner */}
              <div className="relative -mt-10 mb-3">
                <img 
                  src={creator.avatar} 
                  alt={creator.name} 
                  className="w-20 h-20 rounded-full border-4 border-slate100 object-cover"
                />
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-red-500 border-2 border-slate100 rounded-full"></span>
              </div>
              
              <h4 className="text-black dark:text-white font-semibold text-lg">{creator.name}</h4>
              <p className="text-slate-400 text-xs mb-3">{creator.role}</p>
              
              <p className="text-black dark:text-white font-bold text-sm mb-2">
                {creator.followers} <span className="font-normal text-slate-400 text-xs">followers</span>
              </p>
              
              <p className="text-slate-400 text-[11px] mb-6 whitespace-pre-line leading-relaxed">
                {creator.bio}
              </p>
              
              <button className="w-full mt-auto py-2.5 rounded-full bg-orange100 text-black font-semibold text-sm hover:bg-orange200 transition-colors">
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
