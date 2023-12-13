import { SET_MOBILE_NUMBER } from "../constants/useConstant";

const initialState: any = {
  mobile: ''
};

const mobileNumberReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_MOBILE_NUMBER:
      return {...state, mobile:action.payload}
    default:
      return state;
  }
};

export default mobileNumberReducer;
