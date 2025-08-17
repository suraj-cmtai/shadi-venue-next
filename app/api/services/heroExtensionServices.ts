import { HeroExtensionImage, HeroExtensionContent, ImageType } from '@/lib/redux/features/heroExtensionSlice';

// Mock database - replace with actual database operations
let heroExtensionImages: HeroExtensionImage[] = [];
let heroExtensionContent: HeroExtensionContent | null = null;

class HeroExtensionService {
  // Image management methods
  static async getAllImages(): Promise<HeroExtensionImage[]> {
    try {
      // Simulate database fetch
      // Replace with actual database query
      return heroExtensionImages.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
    } catch (error) {
      throw new Error('Failed to fetch hero extension images');
    }
  }

  static async getActiveImages(): Promise<HeroExtensionImage[]> {
    try {
      return heroExtensionImages
        .filter(image => image.status === 'active')
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      throw new Error('Failed to fetch active hero extension images');
    }
  }

  static async getImagesByType(type: ImageType): Promise<HeroExtensionImage[]> {
    try {
      return heroExtensionImages
        .filter(image => image.type === type)
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      throw new Error(`Failed to fetch hero extension images for type: ${type}`);
    }
  }

  static async getActiveImagesByType(type: ImageType): Promise<HeroExtensionImage[]> {
    try {
      return heroExtensionImages
        .filter(image => image.type === type && image.status === 'active')
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      throw new Error(`Failed to fetch active hero extension images for type: ${type}`);
    }
  }

  static async getImageById(id: string): Promise<HeroExtensionImage | null> {
    try {
      return heroExtensionImages.find(image => image.id === id) || null;
    } catch (error) {
      throw new Error('Failed to fetch hero extension image');
    }
  }

  static async createImage(imageData: Omit<HeroExtensionImage, 'id' | 'createdOn' | 'updatedOn'>): Promise<HeroExtensionImage> {
    try {
      const now = new Date().toISOString();
      const newImage: HeroExtensionImage = {
        ...imageData,
        id: `hero_ext_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdOn: now,
        updatedOn: now,
      };

      heroExtensionImages.push(newImage);
      return newImage;
    } catch (error) {
      throw new Error('Failed to create hero extension image');
    }
  }

  static async updateImage(id: string, imageData: Partial<HeroExtensionImage>): Promise<HeroExtensionImage> {
    try {
      const imageIndex = heroExtensionImages.findIndex(image => image.id === id);
      
      if (imageIndex === -1) {
        throw new Error('Hero extension image not found');
      }

      const updatedImage: HeroExtensionImage = {
        ...heroExtensionImages[imageIndex],
        ...imageData,
        updatedOn: new Date().toISOString(),
      };

      heroExtensionImages[imageIndex] = updatedImage;
      return updatedImage;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to update hero extension image');
    }
  }

  static async deleteImage(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const imageIndex = heroExtensionImages.findIndex(image => image.id === id);
      
      if (imageIndex === -1) {
        throw new Error('Hero extension image not found');
      }

      heroExtensionImages.splice(imageIndex, 1);
      return { success: true, message: 'Hero extension image deleted successfully' };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to delete hero extension image');
    }
  }

  static async updateImageOrder(imageId: string, newOrder: number): Promise<HeroExtensionImage> {
    try {
      const image = heroExtensionImages.find(img => img.id === imageId);
      
      if (!image) {
        throw new Error('Hero extension image not found');
      }

      // Update the image order
      image.order = newOrder;
      image.updatedOn = new Date().toISOString();

      return image;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to update hero extension image order');
    }
  }

  // Content management methods
  static async getContent(): Promise<HeroExtensionContent | null> {
    try {
      return heroExtensionContent;
    } catch (error) {
      throw new Error('Failed to fetch hero extension content');
    }
  }

  static async createContent(contentData: Omit<HeroExtensionContent, 'id' | 'createdOn' | 'updatedOn'>): Promise<HeroExtensionContent> {
    try {
      const now = new Date().toISOString();
      const newContent: HeroExtensionContent = {
        ...contentData,
        id: `hero_ext_content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdOn: now,
        updatedOn: now,
      };

      heroExtensionContent = newContent;
      return newContent;
    } catch (error) {
      throw new Error('Failed to create hero extension content');
    }
  }

  static async updateContent(id: string, contentData: Partial<HeroExtensionContent>): Promise<HeroExtensionContent> {
    try {
      if (!heroExtensionContent || heroExtensionContent.id !== id) {
        throw new Error('Hero extension content not found');
      }

      const updatedContent: HeroExtensionContent = {
        ...heroExtensionContent,
        ...contentData,
        updatedOn: new Date().toISOString(),
      };

      heroExtensionContent = updatedContent;
      return updatedContent;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to update hero extension content');
    }
  }

  static async upsertContent(contentData: Omit<HeroExtensionContent, 'id' | 'createdOn' | 'updatedOn'>): Promise<HeroExtensionContent> {
    try {
      if (heroExtensionContent) {
        // Update existing content
        return this.updateContent(heroExtensionContent.id, contentData);
      } else {
        // Create new content
        return this.createContent(contentData);
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to upsert hero extension content');
    }
  }

  // Utility methods
  static async getRandomImageByType(type: ImageType): Promise<HeroExtensionImage | null> {
    try {
      const activeImages = await this.getActiveImagesByType(type);
      if (activeImages.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * activeImages.length);
      return activeImages[randomIndex];
    } catch (error) {
      throw new Error(`Failed to get random image for type: ${type}`);
    }
  }

  static async getImageTypeCounts(): Promise<{ [key in ImageType]: number }> {
    try {
      const counts = {
        tall_left: 0,
        main_center: 0,
        bottom_left: 0,
        center_bottom: 0,
        top_right: 0,
        far_right: 0,
      } as { [key in ImageType]: number };

      heroExtensionImages.forEach(image => {
        if (image.status === 'active') {
          counts[image.type]++;
        }
      });

      return counts;
    } catch (error) {
      throw new Error('Failed to get image type counts');
    }
  }
}

export default HeroExtensionService;