import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

import PageLayout from './PageLayout';

function ErrorPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <Result
        status="error"
        title="Error"
        subTitle="An error occurred, please refresh the page or try again later."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        }
      />
    </PageLayout>
  );
}

export default ErrorPage;
