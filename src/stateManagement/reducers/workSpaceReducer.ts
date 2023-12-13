import { SET_WORK_SPACE_TYPE } from "../constants/useConstant";

const initialState: any = {
  workType: '',
};

const workspaceTypeReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_WORK_SPACE_TYPE:
      return { ...state, workType: action.payload };
    default:
      return state;
  }
};

export default workspaceTypeReducer;
