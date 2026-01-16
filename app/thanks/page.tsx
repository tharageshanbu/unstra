// app/thanks/page.tsx
export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">You're on the list!</h1>
        <p className="text-slate-500 mb-8">
          Thanks for joining Unstra. We'll email you as soon as early access opens. 
          Want to move up the line? Share us on LinkedIn!
        </p>
        <a 
          href="https://www.linkedin.com/sharing/share-offsite/?url=https://unstra.com" 
          target="_blank"
          className="inline-block w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Share on LinkedIn
        </a>
        <div className="mt-8">
          <a href="/" className="text-sm font-bold text-indigo-600 hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}