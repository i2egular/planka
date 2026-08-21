/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/cards:
 *   get:
 *     summary: Search cards in project
 *     description: Searches card name and description across all boards in a project that the current user can access.
 *     tags:
 *       - Cards
 *     operationId: getCardsInProject
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to search cards in
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: search
 *         in: query
 *         required: true
 *         description: Search term to filter cards
 *         schema:
 *           type: string
 *           maxLength: 128
 *           example: bug fix
 *     responses:
 *       200:
 *         description: Cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *                 - included
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *                 included:
 *                   type: object
 *                   required:
 *                     - boards
 *                     - lists
 *                   properties:
 *                     boards:
 *                       type: array
 *                       description: Related boards
 *                       items:
 *                         $ref: '#/components/schemas/Board'
 *                     lists:
 *                       type: array
 *                       description: Related lists
 *                       items:
 *                         $ref: '#/components/schemas/List'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    search: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    let boards;
    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      if (!isProjectManager) {
        const boardMemberships = await BoardMembership.qm.getByProjectIdAndUserId(
          project.id,
          currentUser.id,
        );

        if (boardMemberships.length === 0) {
          throw Errors.PROJECT_NOT_FOUND; // Forbidden
        }

        const boardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
        boards = await Board.qm.getByIds(boardIds);
      }
    }

    if (!boards) {
      boards = await Board.qm.getByProjectId(project.id);
    }

    const boardIds = sails.helpers.utils.mapRecords(boards);

    const cards = await Card.qm.getByProjectId(project.id, {
      boardIds,
      search: inputs.search,
    });

    const listIds = sails.helpers.utils.mapRecords(cards, 'listId', true, true);
    const lists = await List.qm.getByIds(listIds);

    return {
      items: cards,
      included: {
        boards,
        lists,
      },
    };
  },
};
