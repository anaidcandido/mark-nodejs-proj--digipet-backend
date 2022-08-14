import supertest from "supertest";
import { Digipet, setDigipet } from "../digipet/model";
import app from "../server";

/**
 * This file has integration tests for ignoring a digipet.
 *
 * It is intended to test two behaviours:
 *  1. ignoring a digipet leads to decreasing happiness
 *  2. ignoring a digipet leads to decreasing nutrition
 *  3. ignoring a digipet leads to decreasing discipline
 *
 * These have been mostly separated out into two different E2E tests to try to make the tests more robust - it is possible that we might want a change in one but not the other, and it would be annoying to have to fix tests on increasing happiness when there's a change in intended nutrition behaviour.
 */

describe("When a user ignores a digipet repeatedly, its happiness decreases by 10 each time until it eventually floors out at 0", () => {
  beforeAll(() => {
    // setup: give an initial digipet
    const startingDigipet: Digipet = {
      happiness: 20,
      nutrition: 25,
      discipline: 30,
    };
    setDigipet(startingDigipet);
  });

  test("GET /digipet informs them that they have a digipet with expected stats", async () => {
    const response = await supertest(app).get("/digipet");
    expect(response.body.message).toMatch(/your digipet/i);
    expect(response.body.digipet).toHaveProperty("happiness", 20);
    expect(response.body.digipet).toHaveProperty("nutrition", 25);
    expect(response.body.digipet).toHaveProperty("discipline", 30);
  });

  test("1st GET /digipet/ignore informs them about ignoring and shows decrease in happiness, discipline and nutrition", async () => {
    const response = await supertest(app).get("/digipet/ignore");
    expect(response.body.digipet).toHaveProperty("happiness", 10);
    expect(response.body.digipet).toHaveProperty("nutrition", 15);
    expect(response.body.digipet).toHaveProperty("discipline", 20);
  });

  test("2nd GET /digipet/ignore shows continued stats change, happiness hits a top floor of 0 but discipline and nutrition keep decreasing", async () => {
    const response = await supertest(app).get("/digipet/ignore");
    expect(response.body.digipet).toHaveProperty("happiness", 0);
    expect(response.body.digipet).toHaveProperty("nutrition", 5);
    expect(response.body.digipet).toHaveProperty("discipline", 10);
  });

  test("3rd GET /digipet/ignore shows happiness, nutrition and discipline hitting a top floor of 0", async () => {
    const response = await supertest(app).get("/digipet/ignore");
    expect(response.body.digipet).toHaveProperty("happiness", 0);
    expect(response.body.digipet).toHaveProperty("nutrition", 0);
    expect(response.body.digipet).toHaveProperty("discipline", 0);
  });

  test("4th GET /digipet/ignore shows no further decrease", async () => {
    const response = await supertest(app).get("/digipet/ignore");
    expect(response.body.digipet).toHaveProperty("happiness", 0);
    expect(response.body.digipet).toHaveProperty("nutrition", 0);
    expect(response.body.digipet).toHaveProperty("discipline", 0);
  });
});


