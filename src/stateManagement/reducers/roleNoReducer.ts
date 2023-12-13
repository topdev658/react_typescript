import { SET_ROLE_NO } from "../constants/useConstant";

const initialState: any = {
  roleId: 0
};

const userRoleReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_ROLE_NO:
      return {...state, roleId:action.payload}
    default:
      return state;
  }
};

export default userRoleReducer;
