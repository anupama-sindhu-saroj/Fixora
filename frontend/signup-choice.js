// Tailwind Custom Config
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        }
    }
};

// Lucide Icons Setup
import { MapPin, ShieldCheck } from 'https://unpkg.com/lucide@latest';
window.MapPin = MapPin;
window.ShieldCheck = ShieldCheck;
