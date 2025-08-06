import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define what a User looks like
interface IUser {
  name: string;
  email: string;
  password: string;
  googleDrive?: {
    isConnected: boolean;
    accessToken?: string;
    refreshToken?: string;
    connectedAt?: Date;
    lastSyncAt?: Date;
    rootFolderId?: string; // Main "Stash" folder ID in Google Drive
  };
  createdAt: Date;
}

// Create the User schema (database structure)
const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  googleDrive: {
    isConnected: {
      type: Boolean,
      default: false
    },
    accessToken: {
      type: String,
      select: false // Don't return in queries by default
    },
    refreshToken: {
      type: String,
      select: false // Don't return in queries by default
    },
    connectedAt: {
      type: Date
    },
    lastSyncAt: {
      type: Date
    },
    rootFolderId: {
      type: String // Google Drive folder ID for "Stash" folder
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash password if it's new or changed
  if (!this.isModified('password')) return next();
  
  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);