export function axiosParamSerializer(params: {
  [key: string]: string | string[];
}) {
  return Object.keys(params)
    .map((key) => {
      const paramValue = params[key];

      // If the value is an array, convert each item.
      if (Array.isArray(paramValue)) {
        return paramValue
          .map(
            (value) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          )
          .join("&");
      }

      // If the value is a single string, just encode it directly.
      return `${encodeURIComponent(key)}=${encodeURIComponent(paramValue)}`;
    })
    .join("&");
}
