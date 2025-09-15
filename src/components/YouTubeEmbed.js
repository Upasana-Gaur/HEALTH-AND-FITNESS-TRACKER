import React from 'react';

export const YouTubeEmbed = ({ url }) => {
  // Extract video ID from URL
  const videoId = url.split('v=')[1];
  
  return (
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${videoId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="rounded-lg"
    />
  );
};