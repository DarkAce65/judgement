import { PropsWithChildren } from 'react';

const PageLayout = ({ children }: PropsWithChildren) => {
  return <div style={{ minHeight: '100vh', padding: 20 }}>{children}</div>;
};

export default PageLayout;
