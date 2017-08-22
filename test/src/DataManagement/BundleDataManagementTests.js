const mocha = require('mocha');
const fs = require('fs-extra');
const { expect } = require('chai');
const path = require('path');

const BundleDataManager = require(path.join(__dirname, '..', '..', '..', 'src', 'DataManagement', 'BundleDataManager'));

describe("Bundle Data Tests", function() {
  let dataManager = new BundleDataManager();

  before(function() {
    fs.mkdirSync(path.join(__dirname, 'test-bundle-data'));
    fs.mkdirSync(path.join(__dirname, 'test-bundle-data', 'bundles'));
    dataManager.loadBundles(path.join(__dirname, 'test-bundle-data'));
    dataManager
      .createBundle('rooms-bundle')
      .createArea({
        name: 'new-area',
        title: 'New Area',
        suggestedLevel: '1-10'
      });
  });

  after(function() {
    dataManager.deleteBundle('rooms-bundle');
    dataManager.deleteBundle('awesome-bundle');
    fs.removeSync(path.join(__dirname, 'test-bundle-data'));
  });

  describe("BundleDataManagement", function() {
    it("loadBundles loads bundles", function() {
      expect(dataManager.bundles['rooms-bundle']).to.not.be.null;
    });

    describe("bundleExists", function() {
      it("returns true when bundle exists", function() {
        expect(dataManager.bundleExists('rooms-bundle')).to.be.true;
      });

      it("returns false when bundle doesn't exist", function() {
        expect(dataManager.bundleExists('not-a-real-bundle')).to.be.false;
      });
    });

    describe("getBundleDirectory", function() {
      it("getBundleDirectory returns a bundle if it exists", function() {
        expect(dataManager.getBundleDirectory('rooms-bundle')).to.be.ok;
      });

      it("getBundleDirectory returns null if it doesn't exist", function() {
        expect(dataManager.getBundleDirectory('not-a-real-bundle')).to.be.undefined;
      });
    });

    it("createBundle creates a bundle", function() {
      dataManager.createBundle('awesome-bundle');
      expect(dataManager.getBundleDirectory('awesome-bundle')).to.be.ok;
    });
  });

  describe("BundleData", function() {
    let bundle;
    let area;

    before(function(){
      bundle = dataManager.createBundle('test-bundle');
      area = bundle.createArea({
        name: 'test-area',
        title: 'Test Area',
        suggestedLevel: '1-10'
      });
    });

    it("getArea returns an area", function() {
      const area = bundle.getArea('test-area');
      expect(area).to.be.ok;
    });

    describe("createArea", function(){
      it("createArea succeeds with valid manifest", function(){
        const area = bundle.createArea({
          name: 'awesome-area',
          title: 'Awesome Area',
          suggestedLevel: '1-10'
        });

        expect(bundle.areaExists('awesome-area')).to.be.true;

        bundle.deleteArea('awesome-area');
      });

      it("createArea fails with invalid manifest", function(){
        expect(bundle.createArea.bind(bundle, {invalidArgument: true})).to.throw(/name is required/);
      });
    });

    describe("areaExists", function(){
      it("returns true when an area exists", function(){
        expect(bundle.areaExists('test-area')).to.be.true;
      });

      it("returns false when an area doesn't exist", function(){
        expect(bundle.areaExists('not-a-real-area')).to.be.false;
      });
    });

    it("deleteArea should delete an area", function(){
      const area = bundle.createArea({
        name: 'delete-me-area',
        title: 'Delete Me',
        suggestedLevel: '1-10'
      });

      bundle.deleteArea('delete-me-area');

      expect(bundle.areaExists('delete-me-area')).to.be.false;
    });

    after(function(){
      dataManager.deleteBundle('test-bundle');
    });
  });

  describe("AreaData", function(){
    let bundle;
    let area;
    before(function(){
      bundle = dataManager.createBundle('area-data-bundle');
      area = bundle.createArea({
        name: 'new-area',
        title: 'New Area',
        suggestedLevel: '1-20'
      });
    });

    describe("NPC", function(){
      describe("putNpc", function(){
        it("adds when doesn't exist", function() {
          const npc = {
            id: 1,
            name: "Name",
            keywords: ["test"],
            level: 1,
            description: "Description"
          };

          area.putNpc(npc);

          expect(area.getNpc(1)).to.equal(npc);
        });

        it("updates when already exists", function() {
          const originalNpc = {
            id: 2,
            name: "Name",
            keywords: ["test"],
            level: 1,
            description: "Description"
          };

          area.putNpc(originalNpc);

          const updatedNpc = {
            id: 2,
            name: "TEST",
            keywords: ["test"],
            level: 1,
            description: "Description"
          };

          area.putNpc(updatedNpc);

          expect(area.getNpc(2).name).to.equal("TEST");
        });
      });

      it("getNpc gets NPC", function(){
        const npc = {
            id: 3,
            name: "Name",
            keywords: ["test"],
            level: 1,
            description: "Description"
        };

        area.putNpc(npc);

        const gotNpc = area.getNpc(3);

        expect(gotNpc).to.equal(npc);
      });
    });

    describe("ITEM", function(){
      describe("putItem", function(){
        it("adds when doesn't exist", function() {
          const item = {
            id: 1,
            name: "Name",
            keywords: ["test"],
            roomDesc: "Room Description",
            description: "Description"
          };

          area.putItem(item);

          expect(area.getItem(1)).to.equal(item);
        });

        it("updates when already exists", function() {
          const originalItem = {
            id: 2,
            name: "Name",
            keywords: ["test"],
            roomDesc: "Room Description",
            description: "Description"
          };

          area.putItem(originalItem);

          const updatedItem = {
            id: 2,
            name: "TEST",
            keywords: ["test"],
            roomDesc: "Room Description",
            description: "Description"
          };

          area.putItem(updatedItem);

          expect(area.getItem(2).name).to.equal("TEST");
        });
      });

      it("getItem gets item", function(){
        const item = {
            id: 3,
            name: "Name",
            keywords: ["test"],
            roomDesc: "Room Description",
            description: "Description"
        };

        area.putItem(item);

        const gotItem = area.getItem(3);

        expect(gotItem).to.equal(item);
      });
    });

    describe("ROOM", function(){
      describe("putRoom", function(){
        it("adds when doesn't exist", function() {
          const room = {
            id: 1,
            title: "Title",
            description: "Description",
            exits: [
              {
                roomId: "test:1",
                direction: "east",
                leaveMessage: "Leaving"
              }
            ]
          };

          area.putRoom(room);

          expect(area.getRoom(1)).to.equal(room);
        });

        it("updates when already exists", function() {
          const originalRoom = {
            id: 2,
            title: "Title 2",
            description: "Description",
            exits: [
              {
                roomId: "test:1",
                direction: "east",
                leaveMessage: "Leaving"
              }
            ]
          };

          area.putRoom(originalRoom);

          const updatedRoom = {
            id: 2,
            title: "TEST",
            description: "Description",
            exits: [
              {
                roomId: "test:1",
                direction: "east",
                leaveMessage: "Leaving"
              }
            ]
          };

          area.putRoom(updatedRoom);

          expect(area.getRoom(2).title).to.equal("TEST");
        });
      });

      it("getRoom gets room", function(){
        const room = {
            id: 3,
            title: "TEST",
            description: "Description",
            exits: [
              {
                roomId: "test:1",
                direction: "east",
                leaveMessage: "Leaving"
              }
            ]
        };

        area.putRoom(room);

        const gotRoom = area.getRoom(3);

        expect(gotRoom).to.equal(room);
      });
    });
  });
});