import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ANIME } from '@consumet/extensions';
import { StreamingServers } from '@consumet/extensions/dist/models';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const anix = new ANIME.Anix();

  fastify.get('/', (_, rp) => {
    rp.status(200).send({
      intro:
        "Welcome to the Anix provider: check out the provider's website @ https://anix.sh",
      routes: ['/:query', '/recent-episodes', '/info/:id', '/watch/:id/:episodeId', '/servers/:id/:episodeId'],
      documentation: 'https://docs.consumet.org/#tag/anix',
    });
  });

  fastify.get(
    '/recent-episodes',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const page = (request.query as { page: number }).page;
      const type = (request.query as { type: number }).type;
      reply.status(200).send(await anix.fetchRecentEpisodes(page, type));
    },
  );

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;
    const { page = 1 } = request.query as { page?: number };

    const res = await anix.search(query, page);

    reply.status(200).send(res);
  });

  fastify.get(
    '/recent-episodes',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { page = 1 } = request.query as { page?: number };
  
      try {
        const res = await anix.fetchRecentEpisodes(page);
  
        reply.status(200).send(res);
      } catch (err) {
        console.error(err);
        reply
          .status(500)
          .send({ message: 'Something went wrong. Contact developer for help.' });
      }
    },
  );

  fastify.get('/info/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = decodeURIComponent((request.params as { id: string }).id);

    if (typeof id === 'undefined')
        return reply.status(400).send({ message: 'id is required' });

    try {
      const res = await anix
        .fetchAnimeInfo(id)
        .catch((err) => reply.status(404).send({ message: err }));

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  fastify.get('/watch', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = (request.query as { id: string }).id;
    const episodeId = (request.query as { episodeId: string }).episodeId;
    const type = (request.query as { type: string }).type ?? 'sub';
    const server = (request.query as { server: string }).server as StreamingServers;

      if (typeof id === 'undefined')
        return reply.status(400).send({ message: 'id is required' });

      if (typeof episodeId === 'undefined')
        return reply.status(400).send({ message: 'episodeId is required' });
  
      try {
        const res = await anix.fetchEpisodeSources(id, episodeId, server, type);
  
        reply.status(200).send(res);
      } catch (err) {
        console.error(err);
        reply
          .status(500)
          .send({ message: 'Something went wrong. Contact developer for help.' });
      }
    },
  );

  fastify.get(
    '/servers/:id/:episodeId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id, episodeId } = request.params as { id: string; episodeId: string };
  
      try {
        const res = await anix.fetchEpisodeServers(id, episodeId);
  
        reply.status(200).send(res);
      } catch (err) {
        console.error(err);
        reply
          .status(500)
          .send({ message: 'Something went wrong. Contact developer for help.' });
      }
    },
  );
};

export default routes;
