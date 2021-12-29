import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default ErrorPage;
