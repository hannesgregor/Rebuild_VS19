import {ThunkAction} from "redux-thunk";
import {setAlert, setStatus} from "../../app/app-reducer";
import {PasswordApi} from "../../api/api";

const RESET_PASSWORD = 'RESET_PASSWORD'

type ResetPw = {
    type: typeof RESET_PASSWORD
    payload: {
        email: string
    }
}

const initialState = {
    email: null
}

export const resetPwReducer = (state = initialState, action: ResetPw) => {
    switch (action.type) {
        case RESET_PASSWORD: {
            return {
                ...state,
                ...action.payload
            }
        }
    }
}

const ResetPw = (email: string): ResetPw => {
    return {
        type: RESET_PASSWORD,
        payload: {
            email
        }
    }
}

type ThunkType = ThunkAction<any, any, any, any>;

export const resetPw = (email: string): ThunkType => {
    return async (dispatch) => {
        try {
            dispatch(setStatus('loading'))
            PasswordApi.passwordReset(email)
                .then(response => {
                    dispatch(ResetPw(email))
                    dispatch(setStatus('succeeded'))
                    if (response.data.message === "Email sent!") {
                        dispatch(setStatus('confirm'))
                    }
                })
                .catch((error) => {
                    dispatch(setAlert(error.response.data, "error"))
                    dispatch(setStatus('succeeded'))
                })
        } catch (error) {
            console.log(error)
        }
    }
}
