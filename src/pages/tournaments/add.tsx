import { Content } from '../../components/layout/content';
import { Layout } from '../../components/layout/layout';
import { TournamentForm } from '../../components/views/tournament-form';

const Home = () => (
    <Layout>
        <Content label="Add tournament">
            <TournamentForm />
        </Content>
    </Layout>
);

export default Home;
