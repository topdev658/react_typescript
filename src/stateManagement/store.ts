import { createStore, applyMiddleware,combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import userTokenReducer from './reducers/userReducer';
import userIdReducer from './reducers/userIdReducer';
import workspaceTypeReducer from './reducers/workSpaceReducer';
import mobileNumberReducer from './reducers/userNumberReducer';
import userRoleReducer from './reducers/roleNoReducer';

const rootReducer = combineReducers({
  userToken: userTokenReducer,
  userid:userIdReducer,
  workSpace:workspaceTypeReducer,
  userMobile:mobileNumberReducer,
  userRole:userRoleReducer
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export type RootState = ReturnType<typeof rootReducer>;

const store = createStore(
  persistedReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

const persistor = persistStore(store);

export { store, persistor };
