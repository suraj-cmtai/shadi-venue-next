'use client';

import BlogCard from './blogCards';
import BlogHero from './blogHero';


const BlogPage = () => {
    return (
        <section className="bg-black text-white">
            <BlogHero />
            <BlogCard />
        </section>
    );
};

export default BlogPage;
