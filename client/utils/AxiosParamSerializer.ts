export function axiosParamSerializer(params: { [x: string]: string[] }) {
  return Object.keys(params)
    .map((key) =>
      params[key]
        .map(
          (value: string) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join("&")
    )
    .join("&");
}
