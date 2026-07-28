const NotFoundPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-brand-500">404</h1>
      <p className="mt-4 text-lg text-gray-400">Page not found</p>
      <a href="/" className="btn-primary mt-6">
        Go Home
      </a>
    </div>
  );
};

export default NotFoundPage;
