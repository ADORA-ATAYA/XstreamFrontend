import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        {/* Left Side - Company Info */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold">XStream</h2>
          <p className="text-sm mt-2">Bringing the best streaming experience to you.</p>
        </div>
        
        {/* Middle - Contact Details */}
        <div className="text-center mt-4 md:mt-0">
          <p>Email: repleeer@gmail.com</p>
          <p>Phone: +1 234 567 890</p>
          <p>Address: Stark Street, City, Country</p>
        </div>
        
        {/* Right Side - Social Media */}
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="text-white hover:text-gray-300" aria-label="Facebook">
            <FaFacebook size={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-300" aria-label="Twitter">
            <FaTwitter size={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-300" aria-label="Instagram">
            <FaInstagram size={24} />
          </a>
          <a href="#" className="text-white hover:text-gray-300" aria-label="LinkedIn">
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
      
      {/* Bottom Section - Copyright */}
      <div className="text-center mt-6 text-gray-300 text-sm">
        &copy; {new Date().getFullYear()} Your Company. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
