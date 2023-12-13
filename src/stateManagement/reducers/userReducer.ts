
import { LOGOUT, SET_USER_TOKEN } from '../constants/useConstant';

const initialState: any = {
  token: '',
};

const userTokenReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_USER_TOKEN:
      return { ...state, token: action.payload };
    case LOGOUT:
      return {...state,token:""}
    default:
      return state;
  }
};

export default userTokenReducer;
