const normalizeProtocolSegment = (protocolSegment: string): string => {
  if (protocolSegment.startsWith(':') || protocolSegment.startsWith('/')) {
    throw new Error(`Malformed protocol segment: ${protocolSegment}`);
  }

  const protocolSplitIndex = protocolSegment.indexOf(':');
  const protocol = protocolSegment.slice(0, protocolSplitIndex + 1);
  const afterProtocol = protocolSegment.slice(protocolSplitIndex + 1);

  let normalizedSegment = protocol;

  let slashes = 0;
  let c = 0;
  for (; c < afterProtocol.length; c++) {
    const char = afterProtocol[c];
    if (char !== '/') {
      break;
    }

    slashes++;
    if ((protocol === 'file:' && slashes > 3) || (protocol !== 'file:' && slashes > 2)) {
      continue;
    }

    normalizedSegment += char;
  }
  while (slashes < 2) {
    normalizedSegment += '/';
    slashes++;
  }
  normalizedSegment += afterProtocol.slice(c);

  return normalizedSegment;
};

export const join = (...segments: string[]): string => {
  let url = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (segment.length === 0) {
      continue;
    }

    if (url.length === 0 && segment.indexOf(':') !== -1) {
      url += normalizeProtocolSegment(segment);

      continue;
    }

    let normalizedSegment = segment.replaceAll(/([^/]+)\/+/g, '$1/');
    if (url.length === 0) {
      normalizedSegment = normalizedSegment.replace(/^\/{2,}/, '//');
    } else {
      normalizedSegment = normalizedSegment.replace(/^\/+/, '/');
    }

    if (url === 'file://') {
      url += normalizedSegment;
    } else if (url.endsWith('/') && normalizedSegment.startsWith('/')) {
      url += normalizedSegment.replace(/^\/+/, '');
    } else if (url.endsWith('/') || normalizedSegment.startsWith('/')) {
      url += normalizedSegment;
    } else {
      if (url.length === 0) {
        url = normalizedSegment;
      } else {
        url += `/${normalizedSegment}`;
      }
    }
  }

  if (url !== 'file://' && /^[^/]+:\/{2}$/.test(url)) {
    throw new Error(
      `Malformed url from segments: [${segments.map((segment) => `'${segment}'`).join(', ')}]`
    );
  }

  return url;
};
