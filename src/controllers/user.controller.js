import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend ✅
    // validation✅
    // check if user already exists : (userName & email)✅
    // check for images and avatar ✅
    // upload images and avatar to cloudinary ✅
    // create user object - create entry in db✅
    // remove password & refresh token field from response✅
    // check for user creation✅
    // send response to frontend✅

    // --------------------------------------------------------------------------------------------------------------------------------

    // get user details from frontend
    const { fullName, email, userName, password } = req.body;
    console.log(email);

    // validation
    if (
        [fullName, email, userName, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Full name is required");
    }

    // check if user already exists : (userName & email)
    const existedUser = User.findOne({ $or: [{ userName }, { email }] });
    if (existedUser) {
        throw new ApiError(
            409,
            "User with this email or username already exists"
        );
    }

    // check for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // upload images and avatar to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar");
    const coverImage = await uploadOnCloudinary(avatarLocalPath, "coverImage");

    if (!avatar || !coverImage) {
        throw new ApiError(400, "Error uploading images");
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        email,
        userName: userName.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // remove password & refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // check for user creation
    if (!createdUser) {
        throw new ApiError(400, "Error creating user");
    }

    // send response to frontend
    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User register successfully"));
});

export { registerUser };
