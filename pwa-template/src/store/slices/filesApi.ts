import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../../middlewares/authBaseQuery";

export const filesSlice = createApi({
  reducerPath: "filesApi",
  baseQuery: baseQuery,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    uploadImages: builder.mutation<
      {
        imageUrls: string[];
      },
      File[]
    >({
      query: (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return {
          url: `media/upload-multiple`,
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const { useUploadImagesMutation } = filesSlice;
