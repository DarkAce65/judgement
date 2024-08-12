import { PropsWithChildren } from 'react';

const PageLayout = ({ children }: PropsWithChildren) => (
  <div style={{ minHeight: '100vh', padding: 20 }}>{children}</div>
);

export default PageLayout;
