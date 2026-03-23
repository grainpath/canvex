import React from 'react';
import { motion } from 'motion/react';

const About: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto p-8 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl"
    >
      <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        About Canvex
      </h2>
      
      <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
        <p>
          Canvex is a next-generation photo editing platform powered by Gemini AI. 
          We believe that professional-grade photo manipulation should be accessible to everyone through the power of natural language.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-blue-400 mb-3">AI-Powered Retouching</h3>
            <p className="text-sm">Simply click a point on your photo and describe the change you want. Our AI handles the complex masking and blending automatically.</p>
          </div>
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Professional Adjustments</h3>
            <p className="text-sm">Apply complex depth-of-field effects, studio lighting, and detail enhancements with a single click or a custom prompt.</p>
          </div>
        </div>

        <p>
          Built with speed and precision in mind, Canvex combines traditional editing tools like cropping with cutting-edge generative AI to give you complete creative control over your images.
        </p>

        <div className="pt-8 border-t border-gray-700">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Our Mission</h3>
          <p className="italic text-gray-400">
            "To bridge the gap between imagination and image, making the most advanced editing technology as simple as a conversation."
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
