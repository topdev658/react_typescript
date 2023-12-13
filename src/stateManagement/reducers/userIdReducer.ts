
import { LOGOUT, SET_USER_ID} from '../constants/useConstant';

const initialState: any = {
  userId: 0
};

const userIdReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_USER_ID:
      return {...state, userId:action.payload}
    default:
      return state;
  }
};

export default userIdReducer;
