import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { blogPosts } from '../data/content';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Travel Guide', 'Experiences', 'Top Lists', 'Culture', 'Destinations'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts[0];
  const otherPosts = filteredPosts.filter(p => p.id !== featuredPost.id);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      {/* Header */}
      <div className="container-custom mb-12">
        <span className="section-subtitle">Travel Blog</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#15151a] font-normal mt-4">
          Stories & Tips From Morocco
        </h1>
        <p className="text-[#3c3c3c] mt-4 max-w-2xl leading-relaxed">
          Discover travel guides, insider tips, and inspiring stories to help you 
          plan your perfect Moroccan adventure.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="container-custom mb-12">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#C9A96E] text-[#15151a]'
                    : 'bg-[#f6f6f6] text-[#3c3c3c] hover:bg-[#e8e8e8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {!searchQuery && selectedCategory === 'All' && (
        <div className="container-custom mb-16">
          <Link to={`/blog/${featuredPost.slug}`} className="group block">
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
              <img 
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#15151a] via-[#15151a]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                <span className="bg-[#C9A96E] text-[#15151a] text-sm font-medium px-4 py-1 rounded-full">
                  {featuredPost.category}
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl text-white mt-4 group-hover:text-[#C9A96E] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-white/70 mt-3 max-w-2xl line-clamp-2">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 mt-4 text-white/60 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Posts Grid */}
      <div className="container-custom">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post) => (
            <Link 
              to={`/blog/${post.slug}`}
              key={post.id}
              className="group"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
                <img 
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-[#C9A96E] text-sm font-medium">{post.category}</span>
              <h3 className="text-xl text-[#15151a] mt-2 group-hover:text-[#C9A96E] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-[#3c3c3c]/70 mt-2 text-sm line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-4 text-[#3c3c3c]/60 text-sm">
                <span>{post.date}</span>
                <span className="w-1 h-1 bg-[#3c3c3c]/60 rounded-full" />
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#3c3c3c] text-lg">No articles found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="btn-outline mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div className="container-custom mt-20">
        <div className="bg-[#15151a] rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="text-2xl md:text-3xl text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Get the latest travel tips, destination guides, and exclusive offers 
            delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#C9A96E]"
            />
            <button className="btn-gold">
              Subscribe
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
