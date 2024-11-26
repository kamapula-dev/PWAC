import { Rule } from "antd/es/form";

export const requiredValidator = (message: string): Rule => ({
  required: true,
  validator: (_, value) =>
    !value?.trim()?.length ? Promise.reject(message) : Promise.resolve(),
});
