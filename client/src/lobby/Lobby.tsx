import React from 'react';

import { useParams } from 'react-router-dom';

const Lobby = () => {
  const params = useParams<{ roomId: string }>();

  return <h1>hello {params.roomId}</h1>;
};

export default Lobby;
