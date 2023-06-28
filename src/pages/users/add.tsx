import { notifications } from '@mantine/notifications';

import { useGenerateImage } from '@hooks/use-generate-image';
import { User } from '@hooks/use-random-username';
import { api, API_URL } from '@lib/api';

import { Content } from '../../components/layout/content';
import { Layout } from '../../components/layout/layout';
import { UserForm, UserFormData } from '../../components/views/user-form';

const AddUser = () => {
    const { image: generateRandomImage } = useGenerateImage();

    const onSuccessCallback = () => {
        notifications.show({
            title: 'Success',
            message: 'User added successfully',
            color: 'green.5',
            autoClose: 2500
        });
        window.scrollTo(0, 0);
    };

    const onFailureCallback = (error: any) => {
        notifications.show({
            title: 'Error',
            message: error.message || 'Something went wrong',
            color: 'red.5',
            autoClose: 2500
        });
        window.scrollTo(0, 0);
    };

    const handleNewUser = async (values: UserFormData): Promise<User> => {
        if (
            !(
                generateRandomImage &&
                values.username &&
                values.email &&
                values.password &&
                values.countryId &&
                values.roleId
            )
        ) {
            throw new Error('Missing required fields');
        }
        const payload = {
            image: generateRandomImage,
            username: values.username,
            email: values.email,
            password: values.password,
            roleId: Number(values.roleId),
            countryId: Number(values.countryId)
        };

        const { data } = await api.post<User>(`${API_URL}/api/Users`, payload);
        return data;
    };

    const onSubmit = async (data: UserFormData) => {
        try {
            const isSuccessful = await handleNewUser(data);
            if (isSuccessful) {
                // Callback for Success!
                onSuccessCallback();
            } else {
                throw new Error('Something went wrong while adding new user');
            }
        } catch (error) {
            console.error(error);
            onFailureCallback(error);
        }
    };

    return (
        <Layout>
            <Content label="Add user">
                <UserForm onSubmit={onSubmit} />
            </Content>
        </Layout>
    );
};
export default AddUser;
