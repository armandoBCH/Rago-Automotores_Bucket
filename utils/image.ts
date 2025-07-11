
export const slugify = (text: string): string => {
  if (!text) return '';
  
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export const optimizeUrl = (url: string, options: Record<string, any> = {}): string => {
    // Return a placeholder for invalid URLs
    if (!url || typeof url !== 'string') {
        return 'https://i.imgur.com/g2a4A0a.png';
    }

    // If it's a local preview (blob or data URL), return it directly without optimization.
    if (url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    // For external URLs, check if they start with http
    if (!url.startsWith('http')) {
        return 'https://i.imgur.com/g2a4A0a.png';
    }

    try {
        new URL(url); // Validate the URL format to prevent errors
        const baseUrl = 'https://images.weserv.nl/?url=';
        
        // weserv.nl expects the URL without the protocol
        const cleanUrl = url.replace(/^https?:\/\//, '');
        
        const params = new URLSearchParams(options).toString();
        return `${baseUrl}${cleanUrl}&${params}`;
    } catch (e) {
        // If the URL is malformed, return the standard placeholder
        return 'https://i.imgur.com/g2a4A0a.png';
    }
};

export const compressImage = (file: File, options = { maxWidth: 1920, quality: 0.8 }): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const { maxWidth } = options;
                let { width, height } = img;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return reject(new Error('Canvas to Blob conversion failed'));
                        }
                        const newFile = new File([blob], file.name, {
                            type: `image/jpeg`,
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    },
                    `image/jpeg`,
                    options.quality
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};
