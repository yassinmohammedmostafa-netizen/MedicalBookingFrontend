import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdminStats, Appointment, ApproveChangesBody, ApproveDoctorBody, AuthResponse, ChangePasswordBody, CreateAdminUserBody, CreateAppointmentBody, CreateSlotBody, Doctor, DoctorDashboard, ErrorResponse, ForgotPasswordBody, GetDoctorsParams, HealthStatus, LoginBody, RateAppointmentBody, RegisterBody, ResetPasswordAdminBody, ResetPasswordBody, Review, Slot, SuccessResponse, UpdateDoctorAdminBody, UpdateDoctorProfileBody, UpdateProfileBody, UpdateStatusBody, UpdateUserAdminBody, User, VerifyEmailParams } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Register a new patient
 */
export declare const getRegisterUserUrl: () => string;
export declare const registerUser: (registerBody: RegisterBody, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterUserMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerUser>>, TError, {
        data: BodyType<RegisterBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof registerUser>>, TError, {
    data: BodyType<RegisterBody>;
}, TContext>;
export type RegisterUserMutationResult = NonNullable<Awaited<ReturnType<typeof registerUser>>>;
export type RegisterUserMutationBody = BodyType<RegisterBody>;
export type RegisterUserMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Register a new patient
 */
export declare const useRegisterUser: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerUser>>, TError, {
        data: BodyType<RegisterBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof registerUser>>, TError, {
    data: BodyType<RegisterBody>;
}, TContext>;
/**
 * @summary Login
 */
export declare const getLoginUserUrl: () => string;
export declare const loginUser: (loginBody: LoginBody, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginUserMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginUser>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof loginUser>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
export type LoginUserMutationResult = NonNullable<Awaited<ReturnType<typeof loginUser>>>;
export type LoginUserMutationBody = BodyType<LoginBody>;
export type LoginUserMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Login
 */
export declare const useLoginUser: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginUser>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof loginUser>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
/**
 * @summary Logout
 */
export declare const getLogoutUserUrl: () => string;
export declare const logoutUser: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getLogoutUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutUser>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logoutUser>>, TError, void, TContext>;
export type LogoutUserMutationResult = NonNullable<Awaited<ReturnType<typeof logoutUser>>>;
export type LogoutUserMutationError = ErrorType<unknown>;
/**
 * @summary Logout
 */
export declare const useLogoutUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutUser>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logoutUser>>, TError, void, TContext>;
/**
 * @summary Get current user
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Change current user password
 */
export declare const getChangePasswordUrl: () => string;
export declare const changePassword: (changePasswordBody: ChangePasswordBody, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getChangePasswordMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changePassword>>, TError, {
        data: BodyType<ChangePasswordBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof changePassword>>, TError, {
    data: BodyType<ChangePasswordBody>;
}, TContext>;
export type ChangePasswordMutationResult = NonNullable<Awaited<ReturnType<typeof changePassword>>>;
export type ChangePasswordMutationBody = BodyType<ChangePasswordBody>;
export type ChangePasswordMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Change current user password
 */
export declare const useChangePassword: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changePassword>>, TError, {
        data: BodyType<ChangePasswordBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof changePassword>>, TError, {
    data: BodyType<ChangePasswordBody>;
}, TContext>;
/**
 * @summary Update current user profile settings
 */
export declare const getUpdateProfileUrl: () => string;
export declare const updateProfile: (updateProfileBody: UpdateProfileBody, options?: RequestInit) => Promise<User>;
export declare const getUpdateProfileMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<UpdateProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<UpdateProfileBody>;
}, TContext>;
export type UpdateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateProfile>>>;
export type UpdateProfileMutationBody = BodyType<UpdateProfileBody>;
export type UpdateProfileMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update current user profile settings
 */
export declare const useUpdateProfile: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<UpdateProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<UpdateProfileBody>;
}, TContext>;
/**
 * @summary Get current doctor profile
 */
export declare const getGetDoctorProfileUrl: () => string;
export declare const getDoctorProfile: (options?: RequestInit) => Promise<Doctor>;
export declare const getGetDoctorProfileQueryKey: () => readonly ["/api/doctor/profile"];
export declare const getGetDoctorProfileQueryOptions: <TData = Awaited<ReturnType<typeof getDoctorProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDoctorProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDoctorProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getDoctorProfile>>>;
export type GetDoctorProfileQueryError = ErrorType<unknown>;
/**
 * @summary Get current doctor profile
 */
export declare function useGetDoctorProfile<TData = Awaited<ReturnType<typeof getDoctorProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update current doctor profile
 */
export declare const getUpdateDoctorProfileUrl: () => string;
export declare const updateDoctorProfile: (updateDoctorProfileBody: UpdateDoctorProfileBody, options?: RequestInit) => Promise<Doctor>;
export declare const getUpdateDoctorProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDoctorProfile>>, TError, {
        data: BodyType<UpdateDoctorProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDoctorProfile>>, TError, {
    data: BodyType<UpdateDoctorProfileBody>;
}, TContext>;
export type UpdateDoctorProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateDoctorProfile>>>;
export type UpdateDoctorProfileMutationBody = BodyType<UpdateDoctorProfileBody>;
export type UpdateDoctorProfileMutationError = ErrorType<unknown>;
/**
 * @summary Update current doctor profile
 */
export declare const useUpdateDoctorProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDoctorProfile>>, TError, {
        data: BodyType<UpdateDoctorProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDoctorProfile>>, TError, {
    data: BodyType<UpdateDoctorProfileBody>;
}, TContext>;
/**
 * @summary Request a password reset email
 */
export declare const getForgotPasswordUrl: () => string;
export declare const forgotPassword: (forgotPasswordBody: ForgotPasswordBody, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getForgotPasswordMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof forgotPassword>>, TError, {
        data: BodyType<ForgotPasswordBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof forgotPassword>>, TError, {
    data: BodyType<ForgotPasswordBody>;
}, TContext>;
export type ForgotPasswordMutationResult = NonNullable<Awaited<ReturnType<typeof forgotPassword>>>;
export type ForgotPasswordMutationBody = BodyType<ForgotPasswordBody>;
export type ForgotPasswordMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Request a password reset email
 */
export declare const useForgotPassword: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof forgotPassword>>, TError, {
        data: BodyType<ForgotPasswordBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof forgotPassword>>, TError, {
    data: BodyType<ForgotPasswordBody>;
}, TContext>;
/**
 * @summary Reset password using a valid token
 */
export declare const getResetPasswordUrl: () => string;
export declare const resetPassword: (resetPasswordBody: ResetPasswordBody, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getResetPasswordMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resetPassword>>, TError, {
        data: BodyType<ResetPasswordBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resetPassword>>, TError, {
    data: BodyType<ResetPasswordBody>;
}, TContext>;
export type ResetPasswordMutationResult = NonNullable<Awaited<ReturnType<typeof resetPassword>>>;
export type ResetPasswordMutationBody = BodyType<ResetPasswordBody>;
export type ResetPasswordMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Reset password using a valid token
 */
export declare const useResetPassword: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resetPassword>>, TError, {
        data: BodyType<ResetPasswordBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resetPassword>>, TError, {
    data: BodyType<ResetPasswordBody>;
}, TContext>;
/**
 * @summary Verify user email using a token
 */
export declare const getVerifyEmailUrl: (params: VerifyEmailParams) => string;
export declare const verifyEmail: (params: VerifyEmailParams, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getVerifyEmailQueryKey: (params?: VerifyEmailParams) => readonly ["/api/auth/verify-email", ...VerifyEmailParams[]];
export declare const getVerifyEmailQueryOptions: <TData = Awaited<ReturnType<typeof verifyEmail>>, TError = ErrorType<ErrorResponse>>(params: VerifyEmailParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof verifyEmail>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof verifyEmail>>, TError, TData> & {
    queryKey: QueryKey;
};
export type VerifyEmailQueryResult = NonNullable<Awaited<ReturnType<typeof verifyEmail>>>;
export type VerifyEmailQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Verify user email using a token
 */
export declare function useVerifyEmail<TData = Awaited<ReturnType<typeof verifyEmail>>, TError = ErrorType<ErrorResponse>>(params: VerifyEmailParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof verifyEmail>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get list of doctors with optional filters
 */
export declare const getGetDoctorsUrl: (params?: GetDoctorsParams) => string;
export declare const getDoctors: (params?: GetDoctorsParams, options?: RequestInit) => Promise<Doctor[]>;
export declare const getGetDoctorsQueryKey: (params?: GetDoctorsParams) => readonly ["/api/doctors", ...GetDoctorsParams[]];
export declare const getGetDoctorsQueryOptions: <TData = Awaited<ReturnType<typeof getDoctors>>, TError = ErrorType<unknown>>(params?: GetDoctorsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDoctors>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDoctorsQueryResult = NonNullable<Awaited<ReturnType<typeof getDoctors>>>;
export type GetDoctorsQueryError = ErrorType<unknown>;
/**
 * @summary Get list of doctors with optional filters
 */
export declare function useGetDoctors<TData = Awaited<ReturnType<typeof getDoctors>>, TError = ErrorType<unknown>>(params?: GetDoctorsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a doctor's profile
 */
export declare const getGetDoctorUrl: (id: number) => string;
export declare const getDoctor: (id: number, options?: RequestInit) => Promise<Doctor>;
export declare const getGetDoctorQueryKey: (id: number) => readonly [`/api/doctors/${number}`];
export declare const getGetDoctorQueryOptions: <TData = Awaited<ReturnType<typeof getDoctor>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctor>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDoctor>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDoctorQueryResult = NonNullable<Awaited<ReturnType<typeof getDoctor>>>;
export type GetDoctorQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a doctor's profile
 */
export declare function useGetDoctor<TData = Awaited<ReturnType<typeof getDoctor>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctor>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Delete a doctor
 */
export declare const getDeleteDoctorUrl: (id: number) => string;
export declare const deleteDoctor: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteDoctorMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDoctor>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDoctor>>, TError, {
    id: number;
}, TContext>;
export type DeleteDoctorMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDoctor>>>;
export type DeleteDoctorMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Delete a doctor
 */
export declare const useDeleteDoctor: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDoctor>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDoctor>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get available slots for a doctor
 */
export declare const getGetDoctorSlotsUrl: (id: number) => string;
export declare const getDoctorSlots: (id: number, options?: RequestInit) => Promise<Slot[]>;
export declare const getGetDoctorSlotsQueryKey: (id: number) => readonly [`/api/doctors/${number}/slots`];
export declare const getGetDoctorSlotsQueryOptions: <TData = Awaited<ReturnType<typeof getDoctorSlots>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorSlots>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDoctorSlots>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDoctorSlotsQueryResult = NonNullable<Awaited<ReturnType<typeof getDoctorSlots>>>;
export type GetDoctorSlotsQueryError = ErrorType<unknown>;
/**
 * @summary Get available slots for a doctor
 */
export declare function useGetDoctorSlots<TData = Awaited<ReturnType<typeof getDoctorSlots>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorSlots>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get reviews for a doctor
 */
export declare const getGetDoctorReviewsUrl: (id: number) => string;
export declare const getDoctorReviews: (id: number, options?: RequestInit) => Promise<Review[]>;
export declare const getGetDoctorReviewsQueryKey: (id: number) => readonly [`/api/doctors/${number}/reviews`];
export declare const getGetDoctorReviewsQueryOptions: <TData = Awaited<ReturnType<typeof getDoctorReviews>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorReviews>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDoctorReviews>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDoctorReviewsQueryResult = NonNullable<Awaited<ReturnType<typeof getDoctorReviews>>>;
export type GetDoctorReviewsQueryError = ErrorType<unknown>;
/**
 * @summary Get reviews for a doctor
 */
export declare function useGetDoctorReviews<TData = Awaited<ReturnType<typeof getDoctorReviews>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorReviews>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get appointments for the current user (patient or doctor)
 */
export declare const getGetAppointmentsUrl: () => string;
export declare const getAppointments: (options?: RequestInit) => Promise<Appointment[]>;
export declare const getGetAppointmentsQueryKey: () => readonly ["/api/appointments"];
export declare const getGetAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof getAppointments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof getAppointments>>>;
export type GetAppointmentsQueryError = ErrorType<unknown>;
/**
 * @summary Get appointments for the current user (patient or doctor)
 */
export declare function useGetAppointments<TData = Awaited<ReturnType<typeof getAppointments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Book an appointment (patient)
 */
export declare const getCreateAppointmentUrl: () => string;
export declare const createAppointment: (createAppointmentBody: CreateAppointmentBody, options?: RequestInit) => Promise<Appointment>;
export declare const getCreateAppointmentMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<CreateAppointmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<CreateAppointmentBody>;
}, TContext>;
export type CreateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof createAppointment>>>;
export type CreateAppointmentMutationBody = BodyType<CreateAppointmentBody>;
export type CreateAppointmentMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Book an appointment (patient)
 */
export declare const useCreateAppointment: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<CreateAppointmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<CreateAppointmentBody>;
}, TContext>;
/**
 * @summary Get a single appointment
 */
export declare const getGetAppointmentUrl: (id: number) => string;
export declare const getAppointment: (id: number, options?: RequestInit) => Promise<Appointment>;
export declare const getGetAppointmentQueryKey: (id: number) => readonly [`/api/appointments/${number}`];
export declare const getGetAppointmentQueryOptions: <TData = Awaited<ReturnType<typeof getAppointment>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAppointmentQueryResult = NonNullable<Awaited<ReturnType<typeof getAppointment>>>;
export type GetAppointmentQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a single appointment
 */
export declare function useGetAppointment<TData = Awaited<ReturnType<typeof getAppointment>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Mark an appointment as paid (doctor or admin)
 */
export declare const getMarkAppointmentPaidUrl: (id: number) => string;
export declare const markAppointmentPaid: (id: number, options?: RequestInit) => Promise<Appointment>;
export declare const getMarkAppointmentPaidMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAppointmentPaid>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAppointmentPaid>>, TError, {
    id: number;
}, TContext>;
export type MarkAppointmentPaidMutationResult = NonNullable<Awaited<ReturnType<typeof markAppointmentPaid>>>;
export type MarkAppointmentPaidMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Mark an appointment as paid (doctor or admin)
 */
export declare const useMarkAppointmentPaid: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAppointmentPaid>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAppointmentPaid>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Mark an appointment as unpaid (admin only)
 */
export declare const getMarkAppointmentUnpaidUrl: (id: number) => string;
export declare const markAppointmentUnpaid: (id: number, options?: RequestInit) => Promise<Appointment>;
export declare const getMarkAppointmentUnpaidMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAppointmentUnpaid>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAppointmentUnpaid>>, TError, {
    id: number;
}, TContext>;
export type MarkAppointmentUnpaidMutationResult = NonNullable<Awaited<ReturnType<typeof markAppointmentUnpaid>>>;
export type MarkAppointmentUnpaidMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Mark an appointment as unpaid (admin only)
 */
export declare const useMarkAppointmentUnpaid: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAppointmentUnpaid>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAppointmentUnpaid>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Update appointment status (doctor or admin)
 */
export declare const getUpdateAppointmentStatusUrl: (id: number) => string;
export declare const updateAppointmentStatus: (id: number, updateStatusBody: UpdateStatusBody, options?: RequestInit) => Promise<Appointment>;
export declare const getUpdateAppointmentStatusMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAppointmentStatus>>, TError, {
        id: number;
        data: BodyType<UpdateStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAppointmentStatus>>, TError, {
    id: number;
    data: BodyType<UpdateStatusBody>;
}, TContext>;
export type UpdateAppointmentStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateAppointmentStatus>>>;
export type UpdateAppointmentStatusMutationBody = BodyType<UpdateStatusBody>;
export type UpdateAppointmentStatusMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update appointment status (doctor or admin)
 */
export declare const useUpdateAppointmentStatus: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAppointmentStatus>>, TError, {
        id: number;
        data: BodyType<UpdateStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAppointmentStatus>>, TError, {
    id: number;
    data: BodyType<UpdateStatusBody>;
}, TContext>;
/**
 * @summary Rate an appointment (patient)
 */
export declare const getRateAppointmentUrl: (id: number) => string;
export declare const rateAppointment: (id: number, rateAppointmentBody: RateAppointmentBody, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getRateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rateAppointment>>, TError, {
        id: number;
        data: BodyType<RateAppointmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof rateAppointment>>, TError, {
    id: number;
    data: BodyType<RateAppointmentBody>;
}, TContext>;
export type RateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof rateAppointment>>>;
export type RateAppointmentMutationBody = BodyType<RateAppointmentBody>;
export type RateAppointmentMutationError = ErrorType<unknown>;
/**
 * @summary Rate an appointment (patient)
 */
export declare const useRateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rateAppointment>>, TError, {
        id: number;
        data: BodyType<RateAppointmentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof rateAppointment>>, TError, {
    id: number;
    data: BodyType<RateAppointmentBody>;
}, TContext>;
/**
 * @summary Get paid appointments for calendar view (doctor or admin)
 */
export declare const getGetCalendarAppointmentsUrl: () => string;
export declare const getCalendarAppointments: (options?: RequestInit) => Promise<Appointment[]>;
export declare const getGetCalendarAppointmentsQueryKey: () => readonly ["/api/calendar"];
export declare const getGetCalendarAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof getCalendarAppointments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCalendarAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCalendarAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCalendarAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof getCalendarAppointments>>>;
export type GetCalendarAppointmentsQueryError = ErrorType<unknown>;
/**
 * @summary Get paid appointments for calendar view (doctor or admin)
 */
export declare function useGetCalendarAppointments<TData = Awaited<ReturnType<typeof getCalendarAppointments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCalendarAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin - get all appointments
 */
export declare const getGetAdminAppointmentsUrl: () => string;
export declare const getAdminAppointments: (options?: RequestInit) => Promise<Appointment[]>;
export declare const getGetAdminAppointmentsQueryKey: () => readonly ["/api/admin/appointments"];
export declare const getGetAdminAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminAppointments>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminAppointments>>>;
export type GetAdminAppointmentsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Admin - get all appointments
 */
export declare function useGetAdminAppointments<TData = Awaited<ReturnType<typeof getAdminAppointments>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin - get all doctors
 */
export declare const getGetAdminDoctorsUrl: () => string;
export declare const getAdminDoctors: (options?: RequestInit) => Promise<Doctor[]>;
export declare const getGetAdminDoctorsQueryKey: () => readonly ["/api/admin/doctors"];
export declare const getGetAdminDoctorsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminDoctors>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminDoctors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminDoctors>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminDoctorsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminDoctors>>>;
export type GetAdminDoctorsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Admin - get all doctors
 */
export declare function useGetAdminDoctors<TData = Awaited<ReturnType<typeof getAdminDoctors>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminDoctors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin - get platform stats
 */
export declare const getGetAdminStatsUrl: () => string;
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Admin - get platform stats
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin - get all users
 */
export declare const getGetAdminUsersUrl: () => string;
export declare const getAdminUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getGetAdminUsersQueryKey: () => readonly ["/api/admin/users"];
export declare const getGetAdminUsersQueryOptions: <TData = Awaited<ReturnType<typeof getAdminUsers>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminUsersQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminUsers>>>;
export type GetAdminUsersQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Admin - get all users
 */
export declare function useGetAdminUsers<TData = Awaited<ReturnType<typeof getAdminUsers>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin - create a new admin account
 */
export declare const getCreateAdminUserUrl: () => string;
export declare const createAdminUser: (createAdminUserBody: CreateAdminUserBody, options?: RequestInit) => Promise<User>;
export declare const getCreateAdminUserMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdminUser>>, TError, {
        data: BodyType<CreateAdminUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAdminUser>>, TError, {
    data: BodyType<CreateAdminUserBody>;
}, TContext>;
export type CreateAdminUserMutationResult = NonNullable<Awaited<ReturnType<typeof createAdminUser>>>;
export type CreateAdminUserMutationBody = BodyType<CreateAdminUserBody>;
export type CreateAdminUserMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Admin - create a new admin account
 */
export declare const useCreateAdminUser: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdminUser>>, TError, {
        data: BodyType<CreateAdminUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAdminUser>>, TError, {
    data: BodyType<CreateAdminUserBody>;
}, TContext>;
/**
 * @summary Admin - delete a user
 */
export declare const getDeleteUserUrl: (id: number) => string;
export declare const deleteUser: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>;
export type DeleteUserMutationError = ErrorType<unknown>;
/**
 * @summary Admin - delete a user
 */
export declare const useDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Admin - update a user
 */
export declare const getUpdateUserAdminUrl: (id: number) => string;
export declare const updateUserAdmin: (id: number, updateUserAdminBody: UpdateUserAdminBody, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserAdminMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserAdmin>>, TError, {
        id: number;
        data: BodyType<UpdateUserAdminBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUserAdmin>>, TError, {
    id: number;
    data: BodyType<UpdateUserAdminBody>;
}, TContext>;
export type UpdateUserAdminMutationResult = NonNullable<Awaited<ReturnType<typeof updateUserAdmin>>>;
export type UpdateUserAdminMutationBody = BodyType<UpdateUserAdminBody>;
export type UpdateUserAdminMutationError = ErrorType<unknown>;
/**
 * @summary Admin - update a user
 */
export declare const useUpdateUserAdmin: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserAdmin>>, TError, {
        id: number;
        data: BodyType<UpdateUserAdminBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUserAdmin>>, TError, {
    id: number;
    data: BodyType<UpdateUserAdminBody>;
}, TContext>;
/**
 * @summary Admin - reset user password
 */
export declare const getResetUserPasswordAdminUrl: (id: number) => string;
export declare const resetUserPasswordAdmin: (id: number, resetPasswordAdminBody: ResetPasswordAdminBody, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getResetUserPasswordAdminMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resetUserPasswordAdmin>>, TError, {
        id: number;
        data: BodyType<ResetPasswordAdminBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resetUserPasswordAdmin>>, TError, {
    id: number;
    data: BodyType<ResetPasswordAdminBody>;
}, TContext>;
export type ResetUserPasswordAdminMutationResult = NonNullable<Awaited<ReturnType<typeof resetUserPasswordAdmin>>>;
export type ResetUserPasswordAdminMutationBody = BodyType<ResetPasswordAdminBody>;
export type ResetUserPasswordAdminMutationError = ErrorType<unknown>;
/**
 * @summary Admin - reset user password
 */
export declare const useResetUserPasswordAdmin: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resetUserPasswordAdmin>>, TError, {
        id: number;
        data: BodyType<ResetPasswordAdminBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resetUserPasswordAdmin>>, TError, {
    id: number;
    data: BodyType<ResetPasswordAdminBody>;
}, TContext>;
/**
 * @summary Admin - update a doctor
 */
export declare const getUpdateDoctorAdminUrl: (id: number) => string;
export declare const updateDoctorAdmin: (id: number, updateDoctorAdminBody: UpdateDoctorAdminBody, options?: RequestInit) => Promise<Doctor>;
export declare const getUpdateDoctorAdminMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDoctorAdmin>>, TError, {
        id: number;
        data: BodyType<UpdateDoctorAdminBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDoctorAdmin>>, TError, {
    id: number;
    data: BodyType<UpdateDoctorAdminBody>;
}, TContext>;
export type UpdateDoctorAdminMutationResult = NonNullable<Awaited<ReturnType<typeof updateDoctorAdmin>>>;
export type UpdateDoctorAdminMutationBody = BodyType<UpdateDoctorAdminBody>;
export type UpdateDoctorAdminMutationError = ErrorType<unknown>;
/**
 * @summary Admin - update a doctor
 */
export declare const useUpdateDoctorAdmin: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDoctorAdmin>>, TError, {
        id: number;
        data: BodyType<UpdateDoctorAdminBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDoctorAdmin>>, TError, {
    id: number;
    data: BodyType<UpdateDoctorAdminBody>;
}, TContext>;
/**
 * @summary Admin - approve or reject a doctor
 */
export declare const getApproveDoctorUrl: (id: number) => string;
export declare const approveDoctor: (id: number, approveDoctorBody: ApproveDoctorBody, options?: RequestInit) => Promise<Doctor>;
export declare const getApproveDoctorMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveDoctor>>, TError, {
        id: number;
        data: BodyType<ApproveDoctorBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approveDoctor>>, TError, {
    id: number;
    data: BodyType<ApproveDoctorBody>;
}, TContext>;
export type ApproveDoctorMutationResult = NonNullable<Awaited<ReturnType<typeof approveDoctor>>>;
export type ApproveDoctorMutationBody = BodyType<ApproveDoctorBody>;
export type ApproveDoctorMutationError = ErrorType<unknown>;
/**
 * @summary Admin - approve or reject a doctor
 */
export declare const useApproveDoctor: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveDoctor>>, TError, {
        id: number;
        data: BodyType<ApproveDoctorBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approveDoctor>>, TError, {
    id: number;
    data: BodyType<ApproveDoctorBody>;
}, TContext>;
/**
 * @summary Admin - approve or reject doctor profile changes
 */
export declare const getApproveDoctorChangesUrl: (id: number) => string;
export declare const approveDoctorChanges: (id: number, approveChangesBody: ApproveChangesBody, options?: RequestInit) => Promise<Doctor>;
export declare const getApproveDoctorChangesMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveDoctorChanges>>, TError, {
        id: number;
        data: BodyType<ApproveChangesBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approveDoctorChanges>>, TError, {
    id: number;
    data: BodyType<ApproveChangesBody>;
}, TContext>;
export type ApproveDoctorChangesMutationResult = NonNullable<Awaited<ReturnType<typeof approveDoctorChanges>>>;
export type ApproveDoctorChangesMutationBody = BodyType<ApproveChangesBody>;
export type ApproveDoctorChangesMutationError = ErrorType<unknown>;
/**
 * @summary Admin - approve or reject doctor profile changes
 */
export declare const useApproveDoctorChanges: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveDoctorChanges>>, TError, {
        id: number;
        data: BodyType<ApproveChangesBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approveDoctorChanges>>, TError, {
    id: number;
    data: BodyType<ApproveChangesBody>;
}, TContext>;
/**
 * @summary Doctor dashboard stats
 */
export declare const getGetDoctorDashboardUrl: () => string;
export declare const getDoctorDashboard: (options?: RequestInit) => Promise<DoctorDashboard>;
export declare const getGetDoctorDashboardQueryKey: () => readonly ["/api/doctor/dashboard"];
export declare const getGetDoctorDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getDoctorDashboard>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDoctorDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDoctorDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getDoctorDashboard>>>;
export type GetDoctorDashboardQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Doctor dashboard stats
 */
export declare function useGetDoctorDashboard<TData = Awaited<ReturnType<typeof getDoctorDashboard>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current doctor's slots
 */
export declare const getGetDoctorOwnSlotsUrl: () => string;
export declare const getDoctorOwnSlots: (options?: RequestInit) => Promise<Slot[]>;
export declare const getGetDoctorOwnSlotsQueryKey: () => readonly ["/api/doctor/slots"];
export declare const getGetDoctorOwnSlotsQueryOptions: <TData = Awaited<ReturnType<typeof getDoctorOwnSlots>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorOwnSlots>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDoctorOwnSlots>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDoctorOwnSlotsQueryResult = NonNullable<Awaited<ReturnType<typeof getDoctorOwnSlots>>>;
export type GetDoctorOwnSlotsQueryError = ErrorType<unknown>;
/**
 * @summary Get current doctor's slots
 */
export declare function useGetDoctorOwnSlots<TData = Awaited<ReturnType<typeof getDoctorOwnSlots>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorOwnSlots>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create an availability slot (doctor)
 */
export declare const getCreateSlotUrl: () => string;
export declare const createSlot: (createSlotBody: CreateSlotBody, options?: RequestInit) => Promise<Slot>;
export declare const getCreateSlotMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSlot>>, TError, {
        data: BodyType<CreateSlotBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSlot>>, TError, {
    data: BodyType<CreateSlotBody>;
}, TContext>;
export type CreateSlotMutationResult = NonNullable<Awaited<ReturnType<typeof createSlot>>>;
export type CreateSlotMutationBody = BodyType<CreateSlotBody>;
export type CreateSlotMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Create an availability slot (doctor)
 */
export declare const useCreateSlot: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSlot>>, TError, {
        data: BodyType<CreateSlotBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSlot>>, TError, {
    data: BodyType<CreateSlotBody>;
}, TContext>;
/**
 * @summary Delete a slot (doctor)
 */
export declare const getDeleteSlotUrl: (id: number) => string;
export declare const deleteSlot: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteSlotMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSlot>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteSlot>>, TError, {
    id: number;
}, TContext>;
export type DeleteSlotMutationResult = NonNullable<Awaited<ReturnType<typeof deleteSlot>>>;
export type DeleteSlotMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Delete a slot (doctor)
 */
export declare const useDeleteSlot: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSlot>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteSlot>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get list of available specialties
 */
export declare const getGetSpecialtiesUrl: () => string;
export declare const getSpecialties: (options?: RequestInit) => Promise<string[]>;
export declare const getGetSpecialtiesQueryKey: () => readonly ["/api/specialties"];
export declare const getGetSpecialtiesQueryOptions: <TData = Awaited<ReturnType<typeof getSpecialties>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSpecialties>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSpecialties>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSpecialtiesQueryResult = NonNullable<Awaited<ReturnType<typeof getSpecialties>>>;
export type GetSpecialtiesQueryError = ErrorType<unknown>;
/**
 * @summary Get list of available specialties
 */
export declare function useGetSpecialties<TData = Awaited<ReturnType<typeof getSpecialties>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSpecialties>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map