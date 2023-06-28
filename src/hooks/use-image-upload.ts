import { useState } from 'react';

import { API_URL, api } from '@lib/api';

import { UploadImageResponse } from '../pages/games/add';

export const useImageUpload = () => {
    const [loading, setLoading] = useState(false);

    const uploadImage = async (file: File) => {
        setLoading(true);

        const { data } = await api.post<UploadImageResponse>(
            `${API_URL}/api/Image/ImageUpload?typeId=1`,
            {
                File: file
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        setLoading(false);

        return data;
    };

    return {
        loading,
        uploadImage
    };
};
