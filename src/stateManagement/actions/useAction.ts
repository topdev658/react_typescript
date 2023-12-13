import { LOGOUT, SET_MOBILE_NUMBER, SET_ROLE_NO, SET_USER_ID, SET_USER_TOKEN, SET_WORK_SPACE_TYPE } from "../constants/useConstant";

export const userActions = (payload: string) => ({
  type: SET_USER_TOKEN,
  payload,
});

export const userIdAction = (payload: number | undefined) => ({
  type: SET_USER_ID,
  payload,
});

export const workspaceType = (payload: string | undefined) => ({
  type: SET_WORK_SPACE_TYPE,
  payload,
});

export const mobileNumberAction = (payload: string | undefined) => ({
  type: SET_MOBILE_NUMBER,
  payload,
});

export const roleNoAction = (payload: number | undefined) => ({
  type: SET_ROLE_NO,
  payload,
});

export const logoutAction = () => ({
  type: LOGOUT,
});
