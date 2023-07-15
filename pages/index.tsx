import Layout from '../components/layout';
import { useEffect, useState } from 'react';

export default function IndexPage() {
  const imagePaths = [
    '/assets/Screenshot_01.png',
    '/assets/Screenshot_02.png',
    '/assets/Screenshot_03.png',
    '/assets/Screenshot_04.png',
    '/assets/Screenshot_05.png'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % imagePaths.length);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Layout>
      <div className="text-center mt-11 min-w-[300px] max-w-[350px] md:min-w-[350px] md:max-w-[500px] mx-auto">
        <h1 className="font-bold">Meal Planner website</h1>
        <p className="mt-3 mb-1 whitespace-pre-line">
          This is a meal planner webiste. <br></br>
          You can use existing snacks and recipies or create your own. <br></br>
          The app will create a shopping list based on your weekly meal plan.
        </p>
      </div>
      <div className="mt-3 md:mt-5 relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] mx-auto overflow-hidden">
        {imagePaths.map((path, index) => (
          <img
            key={index}
            src={path}
            alt={`Picture ${index + 1}`}
            className={`absolute top-0 left-0 opacity-0 ${index === currentImageIndex ? 'opacity-100' : ''}`}
            style={{
              transition: 'opacity 2s'
            }}
          />
        ))}
      </div>
    </Layout>
  );
}
