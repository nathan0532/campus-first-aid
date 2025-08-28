import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

interface BannerProps {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  gradient?: boolean;
}

const Banner: React.FC<BannerProps> = ({
  title,
  subtitle,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundImage,
  gradient = true,
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl mb-12 ${gradient ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' : 'bg-gray-900'}`}>
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Banner background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Subtitle */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
            {subtitle}
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={primaryButtonLink}
              className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              {primaryButtonText}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            
            {secondaryButtonText && secondaryButtonLink && (
              <Link
                to={secondaryButtonLink}
                className="inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/30 group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
    </div>
  );
};

export default Banner;