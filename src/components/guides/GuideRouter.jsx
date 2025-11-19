import React from 'react';
import { useParams } from 'react-router-dom';
import BrandedQRGuide from './BrandedQRGuide';
import VectorQRGuide from './VectorQRGuide';
import EditableQRGuide from './EditableQRGuide';

const GuideRouter = () => {
  const { slug } = useParams();

  // Map slugs to components
  const guideComponents = {
    'branded-qr-code-analytics': BrandedQRGuide,
    'vector-qr-codes': VectorQRGuide,
    'editable-qr-codes': EditableQRGuide,
  };

  const GuideComponent = guideComponents[slug];

  // If no matching component found, return null (will show 404 in GuideLayout)
  if (!GuideComponent) {
    return <div>Guide not found</div>;
  }

  return <GuideComponent />;
};

export default GuideRouter;

