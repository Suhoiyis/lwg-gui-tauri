import { Image as ImageIcon, Video } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Wallpaper } from "@/types"; // 确保你定义了 types.ts

interface WallpaperCardProps {
  wp: Wallpaper;
  isSelected: boolean;
  onSelect: () => void;
}

export function WallpaperCard({ wp, isSelected, onSelect }: WallpaperCardProps) {
  return (
    <div onClick={onSelect} className="cursor-pointer">
      <CardContainer className="inter-var w-full">
        <CardBody className={`
          relative group/card bg-card border-border/50 w-full rounded-2xl p-2 border transition-all
          ${isSelected ? 'ring-2 ring-pink-500 ring-offset-4 ring-offset-background bg-muted/50' : 'hover:border-pink-500/50'}
        `}>
          <CardItem translateZ="50" className="w-full aspect-square rounded-xl overflow-hidden relative">
            <img 
              src={wp.preview} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110" 
              alt={wp.title}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
              <p className="text-[11px] font-bold text-white truncate">{wp.title}</p>
            </div>
            <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
              {wp.type === 'Video' ? <Video className="w-3 h-3 text-pink-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </div>
  );
}