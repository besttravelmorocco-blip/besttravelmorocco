import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { blogPosts } from '../data/content';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <h1 className="text-2xl text-[#15151a] mb-4">Article not found</h1>
          <Link to="/blog" className="btn-primary">Browse All Articles</Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      {/* Back Link */}
      <div className="container-custom mb-8">
        <Link to="/blog" className="flex items-center gap-2 text-[#3c3c3c] hover:text-[#C9A96E] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>

      {/* Header */}
      <div className="container-custom mb-12">
        <span className="text-[#C9A96E] text-sm font-medium">{post.category}</span>
        <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#15151a] font-normal mt-4 mb-6">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={post.authorImage} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="text-[#15151a] font-medium">{post.author}</div>
              <div className="text-[#3c3c3c]/60 text-sm">Travel Expert</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#3c3c3c]/60 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="container-custom mb-12">
        <div className="aspect-[21/9] overflow-hidden rounded-2xl">
          <img 
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="container-custom">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
            />

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-[#e8e8e8]">
              <h4 className="text-[#15151a] font-medium mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share this article
              </h4>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-[#0A66C2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#f6f6f6] rounded-lg p-6 sticky top-32">
              <h4 className="text-[#15151a] font-medium mb-4">About the Author</h4>
              <div className="flex items-center gap-4 mb-4">
                <img src={post.authorImage} alt={post.author} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <div className="text-[#15151a] font-medium">{post.author}</div>
                  <div className="text-[#3c3c3c]/60 text-sm">Travel Expert</div>
                </div>
              </div>
              <p className="text-[#3c3c3c]/70 text-sm">
                Passionate about sharing the beauty and culture of Morocco with travelers from around the world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="container-custom mt-20">
          <h2 className="text-2xl text-[#15151a] mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link 
                to={`/blog/${relatedPost.slug}`}
                key={relatedPost.id}
                className="group"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
                  <img 
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="text-[#C9A96E] text-sm">{relatedPost.category}</span>
                <h3 className="text-lg text-[#15151a] mt-2 group-hover:text-[#C9A96E] transition-colors line-clamp-2">
                  {relatedPost.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;
