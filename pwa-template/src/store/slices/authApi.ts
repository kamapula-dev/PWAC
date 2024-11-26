import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginBody, LoginResponse } from "../../models/user";

export const authSlice = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://pwac.world/" }),
  tagTypes: ["CurrentUser"],
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginBody>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentUser"],
    }),
  }),
});

export const { useLoginMutation } = authSlice;
