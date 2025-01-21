import { google } from '@ai-sdk/google';
import { pipeDataStreamToResponse, streamText } from 'ai';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';
import cors from 'cors';

const PORT = process.env.PORT || 8082;

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/', async (req: Request, res: Response) => {
  try {
    const messages = req.body?.messages;
    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
    });
    
    return result.pipeDataStreamToResponse(res);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get('/alive', (req: Request, res: Response) => {
  try {
    res.json({ alive: true })
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
})

app.post('/stream-data', async (req: Request, res: Response) => {
  // immediately start streaming the response
  pipeDataStreamToResponse(res, {
    execute: async dataStreamWriter => {
      dataStreamWriter.writeData('initialized call');

      const result = streamText({
        model: google('gemini-1.5-flash'),
        prompt: 'Invent a new holiday and describe its traditions.',
      });
      result.mergeIntoDataStream(dataStreamWriter);
    },
    onError: error => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      console.log('error', error);
      return error instanceof Error ? error.message : String(error);
    },
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

