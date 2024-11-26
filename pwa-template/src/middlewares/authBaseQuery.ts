import {
  BaseQueryFn,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchArgs,
} from "@reduxjs/toolkit/query/react";

import { createAuthProvider } from "./authProvider";

const baseQuery: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const { logout } = createAuthProvider();
  const localStorageToken = localStorage.getItem("REACT_TOKEN_AUTH");
  if (!localStorageToken) {
    return {
      error: { status: 401, data: "No token found" } as FetchBaseQueryError,
    };
  }

  const token = JSON.parse(localStorageToken);

  const customFetchBase = fetchBaseQuery({
    baseUrl: "https://pwac.world/",
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  const result = await customFetchBase(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    logout();
  }

  return result;
};

export default baseQuery;
